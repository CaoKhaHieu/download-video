/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';
import ytdl from 'ytdl-core';
import { NextResponse } from 'next/server';

export async function GET() {
  // const videoUrl = 'https://www.youtube.com/watch?v=Q_oBBxPADd8';
  const videoUrl = 'https://www.youtube.com/watch?v=akeytNVcIy4';
  const fileName = `output-${new Date().getTime()}`;

  if (!videoUrl || !fileName) {
    return NextResponse.json({ message: 'Missing required fields' });
  }

  const outputFilePath = path.join(process.cwd(), 'public', `${fileName}.mp4`);

  try {

    const videoStream = ytdl(videoUrl, { quality: 'highestvideo', filter: 'videoandaudio' });
    const fileStream = fs.createWriteStream(outputFilePath);

    videoStream.pipe(fileStream);

    let downloadedBytes = 0;
    let totalBytes = 0;

    videoStream.on('response', (response: any) => {
      totalBytes = parseInt(response.headers['content-length'], 10);
    });

    videoStream.on('data', (chunk: any) => {
      downloadedBytes += chunk.length;
      const progress = (downloadedBytes / totalBytes) * 100;
      console.log(`Progress: ${progress.toFixed(2)}%`);
    });

    // Bọc fileStream trong một lời hứa
    await new Promise((resolve, reject) => {
      fileStream.on('finish', resolve);
      fileStream.on('error', reject);
    });

    return NextResponse.json({ message: 'Download complete', filePath: `/${fileName}.mp4` });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Error during download', error: error.message });
  }
}
