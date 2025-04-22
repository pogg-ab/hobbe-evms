import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button, Stack, IconButton, Typography, Box, TextField, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { Mic, MicOff, Videocam, VideocamOff, PlayArrow, Stop } from '@mui/icons-material';
import axios from 'axios';
import io from 'socket.io-client';


const Streamer = () => {
    const webcamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [devices, setDevices] = useState([]);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [stream, setStream] = useState(null);
    const [status, setStatus] = useState('Ready');
    const [eventId, setEventId] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [timezone, setTimezone] = useState('');
    const [existingStreams, setExistingStreams] = useState([]);
    const [selectedStream, setSelectedStream] = useState(null);
    const [socket, setSocket] = useState(null);


    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };
    useEffect(() => {
        const newSocket = io('http://localhost:4003/stream', {

        });
        setSocket(newSocket);

        return () => newSocket.disconnect();
    }, []);

    useEffect(() => {
        const fetchStreams = async () => {
            try {
                const response = await axios.get('http://localhost:4003/streams/inactive');
                setExistingStreams(response.data);
            } catch (error) {
                console.error('Error fetching streams:', error);
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

            if (webcamRef.current) {
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

    const startStreaming = async () => {
        if (!stream || !selectedStream) {
            setStatus('Start media and select a stream first');
            return;
        }

        try {
            const response = await axios.post(`http://localhost:4003/streams/${selectedStream.id}/start-scheduled`, {
                source: {
                    type: 'camera',
                    filePath: ''
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
            console.log(response.data)

            const wsPort = response.data.port; // Get the TCP port from response
            const wsUrl = `ws://localhost:${wsPort}`;
            const socket = new WebSocket(wsUrl);
            setStatus('Connecting to WebSocket...');

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9,opus',
                videoBitsPerSecond: 2000000
            });

            mediaRecorderRef.current = mediaRecorder;

            socket.onopen = () => {
                setStatus('Streaming...');
                setRecording(true);

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
                        // Convert Blob to ArrayBuffer before sending
                        const reader = new FileReader();
                        reader.onload = () => {
                            socket.send(reader.result);
                        };
                        reader.readAsArrayBuffer(event.data);
                    }
                };

                mediaRecorder.start(100); // Collect data every 100ms
            };

            socket.onerror = (err) => {
                console.error('WebSocket error:', err);
                setStatus('WebSocket error');
            };

            socket.onclose = () => {
                console.log('WebSocket closed');
                setStatus('Stream ended');
                setRecording(false);
            };

        } catch (err) {
            console.error('Error starting stream:', err);
            setStatus('Stream failed to start');
        }
    };


    const stopStreaming = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        setRecording(false);
        setStatus('Stream Stopped');
    };

    const handleStreamChange = (event: SelectChangeEvent) => {
        const streamId = event.target.value;
        const selectedStream = existingStreams.find(stream => stream.id === streamId);
        setSelectedStream(selectedStream);
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
