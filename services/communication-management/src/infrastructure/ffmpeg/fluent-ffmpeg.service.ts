import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';

@Injectable()
export class FluentFFmpegService {
  constructor() {
    ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH || 'ffmpeg');
  }
  async transcodeStream(
    inputStream: string | fs.ReadStream,
    outputStream: string | NodeJS.WritableStream,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputStream)
        .output(outputStream)
        .on('start', (commandLine) => {
          console.log(`FFmpeg process started with command: ${commandLine}`);
        })
        .on('end', () => {
          console.log('FFmpeg process finished.');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        });

      command.run();
    });
  }

  async streamFileToRtmp(inputFilePath: string, rtmpUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputFilePath)
        .inputFormat('mp4')
        .output(rtmpUrl)
        .outputOptions([
          '-c:v libx264',
          '-preset veryfast',
          '-maxrate 800k',
          '-bufsize 1600k',
          '-vf scale=640:360',
          '-c:a aac',
          '-b:a 128k',
          '-f flv',
        ])
        .on('start', (commandLine) => {
          console.log(`FFmpeg process started with command: ${commandLine}`);
        })
        .on('end', () => {
          console.log('Streaming finished.');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        });

      command.run();
    });
  }
}