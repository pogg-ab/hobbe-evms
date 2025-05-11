import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button, Stack, IconButton, Typography, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Mic, MicOff, Videocam, VideocamOff, PlayArrow, Stop } from '@mui/icons-material';
import axios from 'axios';
import { Device } from 'mediasoup-client';

const Streamer = () => {
    const webcamRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [devices, setDevices] = useState([]);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [stream, setStream] = useState(null);
    const [status, setStatus] = useState('Ready');
    const [existingStreams, setExistingStreams] = useState([]);
    const [selectedStream, setSelectedStream] = useState(null);

    // MediaSoup related state
    const [mediaSoupDevice, setMediaSoupDevice] = useState(null);
    const [sendTransport, setSendTransport] = useState(null);
    const [videoProducer, setVideoProducer] = useState(null);
    const [audioProducer, setAudioProducer] = useState(null);

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };

    useEffect(() => {
        // Initialize MediaSoup device
        const device = new Device();
        setMediaSoupDevice(device);

        return () => {
            if (sendTransport) {
                sendTransport.close();
            }
            if (videoProducer) {
                videoProducer.close();
            }
            if (audioProducer) {
                audioProducer.close();
            }
        };
    }, []);

    useEffect(() => {
        const fetchStreams = async () => {
            try {
                const response = await axios.get('http://localhost:4003/streams/inactive');
                setExistingStreams(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Error fetching streams:', error);
                setExistingStreams([]);
            }
        };

        fetchStreams();
    }, []);

    const getDevices = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            setDevices(devices.filter(device => device.kind === 'videoinput' || device.kind === 'audioinput'));
        } catch (err) {
            console.error('Error getting devices:', err);
        }
    };

    const startMedia = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: videoEnabled ? videoConstraints : false,
                audio: audioEnabled
            });

            if (webcamRef.current && webcamRef.current.video) {
                webcamRef.current.video.srcObject = mediaStream;
            }

            setStream(mediaStream);
            await getDevices();
            setStatus('Media Active');
        } catch (err) {
            console.error('Error accessing media:', err);
            setStatus(`Error: ${err.message}`);
        }
    };

    const stopMedia = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setStatus('Media Stopped');
        }
    };

    const toggleAudio = () => {
        if (stream) {
            const audioTracks = stream.getAudioTracks();
            audioTracks.forEach(track => track.enabled = !audioEnabled);
        }
        setAudioEnabled(!audioEnabled);
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTracks = stream.getVideoTracks();
            videoTracks.forEach(track => track.enabled = !videoEnabled);
        }
        setVideoEnabled(!videoEnabled);
    };

    const initializeMediaSoup = async () => {
        if (!mediaSoupDevice || !selectedStream) {
            console.error('MediaSoup device or stream not selected');
            return null;
        }

        try {
            setStatus('Initializing WebRTC connection...');

            // 1. Get router capabilities (should be GET request)
            const { data: { routerRtpCapabilities } } = await axios.get(
                `http://localhost:4003/streams/${selectedStream.id}/router-capabilities`
            );

            // Load the device with router capabilities
            await mediaSoupDevice.load({ routerRtpCapabilities });

            // 2. Create WebRTC transport
            const { data: transportOptions } = await axios.post(
                `http://localhost:4003/streams/${selectedStream.id}/create-transport`,
                {
                    forceTcp: false,
                    producing: true,
                    consuming: false
                }
            );

            // Create the send transport
            const transport = mediaSoupDevice.createSendTransport(transportOptions);

            // Set up transport event handlers
            transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
                try {
                    await axios.post(
                        `http://localhost:4003/streams/${selectedStream.id}/connect-transport`,
                        {
                            transportId: transport.id,
                            dtlsParameters
                        }
                    );
                    callback();
                } catch (error) {
                    console.error('Transport connect failed:', error);
                    errback(error);
                }
            });

            transport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
                try {
                    const { data: { id } } = await axios.post(
                        `http://localhost:4003/streams/${selectedStream.id}/produce`,
                        {
                            transportId: transport.id,
                            kind,
                            rtpParameters
                        }
                    );
                    callback({ id });
                } catch (error) {
                    console.error('Produce failed:', error);
                    errback(error);
                }
            });

            transport.on('connectionstatechange', (state) => {
                console.log('Transport connection state:', state);
                if (state === 'failed' || state === 'disconnected') {
                    setStatus(`WebRTC connection ${state}`);
                }
            });

            setSendTransport(transport);
            return transport;
        } catch (error) {
            console.error('MediaSoup initialization failed:', error);
            setStatus('WebRTC connection failed');

            // Clean up if anything failed
            if (sendTransport) {
                sendTransport.close();
                setSendTransport(null);
            }

            throw error;
        }
    };

    const startStreaming = async () => {
        if (!stream || !selectedStream) {
            setStatus('Start media and select a stream first');
            return;
        }

        try {
            // Initialize MediaSoup connection
            const transport = await initializeMediaSoup();
            if (!transport) throw new Error('Transport not initialized');

            // Start the stream on the server
            await axios.post(`http://localhost:4003/streams/${selectedStream.id}/start-scheduled`, {
                source: {
                    type: 'webrtc',
                    streamId: selectedStream.id
                },
                video: {
                    enabled: true,
                    resolution: "1280x720",
                    framerate: 30,
                    bitrate: 2000,
                    maxBitrate: 2500,
                    bufferSize: 4000,
                    gop: 60,
                    keyintMin: 60,
                    pixelFormat: "yuv420p",
                    hwAccel: "none"
                },
                audio: {
                    enabled: true,
                    sampleRate: 22050,
                    channels: 1
                },
                hardwareAcceleration: false
            });

            // Send video track
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                const videoProducer = await transport.produce({
                    track: videoTrack,
                    encodings: [
                        { maxBitrate: 2500000 }
                    ],
                    codecOptions: {
                        videoGoogleStartBitrate: 2000
                    }
                });
                setVideoProducer(videoProducer);
            }

            // Send audio track
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                const audioProducer = await transport.produce({
                    track: audioTrack
                });
                setAudioProducer(audioProducer);
            }

            setRecording(true);
            setStatus('Streaming via WebRTC...');
        } catch (err) {
            console.error('Error starting stream:', err);
            setStatus(`Stream failed to start: ${err.message}`);
        }
    };

    const stopStreaming = async () => {
        try {
            if (videoProducer) {
                videoProducer.close();
                setVideoProducer(null);
            }
            if (audioProducer) {
                audioProducer.close();
                setAudioProducer(null);
            }
            if (sendTransport) {
                sendTransport.close();
                setSendTransport(null);
            }

            if (selectedStream) {
                await axios.post(`http://localhost:4003/streams/${selectedStream.id}/stop`);
            }

            setRecording(false);
            setStatus('Stream Stopped');
        } catch (err) {
            console.error('Error stopping stream:', err);
            setStatus(`Error stopping stream: ${err.message}`);
        }
    };

    const handleStreamChange = (event) => {
        const streamId = event.target.value;
        const selected = existingStreams.find(stream => stream.id === streamId) || null;
        setSelectedStream(selected);
        setStream(null);
    };

    return (
        <Box sx={{ maxWidth: 800, margin: 'auto', p: 3 }}>
            <Typography variant="h4" gutterBottom>Stream Control Demo</Typography>

            <Typography variant="h6" gutterBottom>Existing Streams</Typography>
            <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                    <InputLabel>Select Stream</InputLabel>
                    <Select
                        value={selectedStream?.id || ''}
                        onChange={handleStreamChange}
                        label="Select Stream"
                    >
                        {existingStreams.map((stream) => (
                            <MenuItem key={stream.id} value={stream.id}>
                                {stream.eventId} - {stream.startDate}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {selectedStream && (
                <>
                    <span>{status}</span>
                    <Box sx={{ mb: 3, border: '1px solid #ddd', borderRadius: 1 }}>
                        <Webcam
                            audio={audioEnabled}
                            ref={webcamRef}
                            videoConstraints={videoConstraints}
                            style={{
                                width: '100%',
                                display: videoEnabled ? 'block' : 'none'
                            }}
                        />
                        {!videoEnabled && (
                            <Box sx={{
                                width: '100%',
                                height: 480,
                                bgcolor: 'black',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Typography variant="h6" color="white">Camera Disabled</Typography>
                            </Box>
                        )}
                    </Box>

                    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                        <Button
                            variant="contained"
                            onClick={stream ? stopMedia : startMedia}
                            startIcon={stream ? <Stop /> : <PlayArrow />}
                        >
                            {stream ? 'Stop Media' : 'Start Media'}
                        </Button>

                        <IconButton
                            color={audioEnabled ? 'primary' : 'error'}
                            onClick={toggleAudio}
                            aria-label="toggle microphone"
                        >
                            {audioEnabled ? <Mic /> : <MicOff />}
                        </IconButton>

                        <IconButton
                            color={videoEnabled ? 'primary' : 'error'}
                            onClick={toggleVideo}
                            aria-label="toggle camera"
                        >
                            {videoEnabled ? <Videocam /> : <VideocamOff />}
                        </IconButton>
                    </Stack>

                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            color={recording ? 'error' : 'success'}
                            onClick={recording ? stopStreaming : startStreaming}
                            disabled={!stream}
                            startIcon={recording ? <Stop /> : <PlayArrow />}
                        >
                            {recording ? 'Stop Streaming' : 'Start Streaming'}
                        </Button>
                    </Stack>
                </>
            )}

            {devices.length > 0 && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6">Available Devices:</Typography>
                    <ul>
                        {devices.map((device, index) => (
                            <li key={device.deviceId}>
                                {device.kind === 'videoinput' ? 'Camera' : 'Microphone'} {index + 1}: {device.label || `Device ${index + 1}`}
                            </li>
                        ))}
                    </ul>
                </Box>
            )}
        </Box>
    );
};

export default Streamer;