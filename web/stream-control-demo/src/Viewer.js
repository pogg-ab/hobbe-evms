import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';

function Viewer() {
    const videoRef = useRef(null);
    const [streams, setStreams] = useState([]);
    const [selectedStream, setSelectedStream] = useState(null);



    useEffect(() => {
        const fetchStreams = async () => {
            try {
                const response = await axios.get('http://localhost:4003/streams/active');
                setStreams(response.data);
            } catch (error) {
                console.error('Error fetching streams:', error);
            }
        };

        fetchStreams();
    }, []);

    useEffect(() => {
        if (!selectedStream || !videoRef.current) return;

        const video = videoRef.current;

        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(selectedStream.hlsOutputPath);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play();
            });

            return () => {
                hls.destroy();
            };
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = selectedStream.url;
            video.addEventListener('loadedmetadata', () => {
                video.play();
            });
        }
    }, [selectedStream]);

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Viewer
            </Typography>

            {streams.length > 0 ? (
                <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <List>
                        {streams.map((stream) => (
                            <ListItem
                                button
                                key={stream.id}
                                onClick={() => setSelectedStream(stream)}
                                selected={selectedStream?.id === stream.id}
                                sx={{
                                    '&:hover': { backgroundColor: '#f5f5f5', cursor: 'pointer' },
                                }}
                            >
                                <ListItemText primary={`${stream.eventId} - ${stream.startDate} - ${stream.status} `} />
                            </ListItem>
                        ))}
                    </List>
                </div>
            ) : (
                <Typography>No active streams found.</Typography>
            )}


            {selectedStream && (
                <>
                    <Typography variant="h6" style={{ marginTop: '1rem' }}>
                        Now Viewing: {selectedStream.name}
                    </Typography>
                    <video
                        ref={videoRef}
                        controls
                        style={{ width: '100%', maxHeight: '500px', marginTop: '1rem' }}
                    />
                </>
            )}
        </div>
    );
}

export default Viewer;
