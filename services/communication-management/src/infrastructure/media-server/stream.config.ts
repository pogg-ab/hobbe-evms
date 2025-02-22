export const streamConfig = () => {
  console.log('Loaded Environment Variables:');
  console.log('NMS_RTMP_PORT:', process.env.NMS_RTMP_PORT);
  console.log('NMS_HTTP_PORT:', process.env.NMS_HTTP_PORT);
  console.log('NMS_MEDIA_ROOT:', process.env.NMS_MEDIA_ROOT);
  console.log('FFMPEG_PATH:', process.env.FFMPEG_PATH);

  return {
    nodeMediaServer: {
      rtmp: {
        port: parseInt(process.env.NMS_RTMP_PORT || '1935', 10),
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_interval: 60,
      },
      http: {
        port: parseInt(process.env.NMS_HTTP_PORT || '8000', 10),
        mediaroot: process.env.NMS_MEDIA_ROOT || './media',
        allow_origin: process.env.NMS_ALLOW_ORIGIN || '*',
      },
      trans: {
        ffmpeg: process.env.FFMPEG_PATH || '/usr/local/bin/ffmpeg',
        tasks: [
          {
            app: 'live',
            hls: true,
            hlsFlags: '[hls_time=2:hls_list_size=6:hls_flags=delete_segments]',
          },
        ],
      },
    },
  };
};