#!/bin/bash

FFMPEG_PARAMS="$1"
DOWNLOAD_FILES="$2"
UPLOAD_FILES="$3"


TIMESTAMP=$(date +%s%3N)  

curl -s -X POST http://192.168.0.116:30080/video-coding \
    -H "Ce-createdtime: $TIMESTAMP" \
    -H 'Content-Type: application/json' \
    -H 'Ce-Type: encoder' \
    -H 'Ce-Specversion: 1.0' \
    -H 'Ce-Source: /HttpEventSource' \
    -H "Ce-Id: 1" \
    -d "{
\"ffmpegParams\": \"$FFMPEG_PARAMS\",
\"datamesh\": {
    \"downloadFiles\": [$DOWNLOAD_FILES],
    \"uploadFiles\": [$UPLOAD_FILES],
    \"uploadUrl\": \"http://192.168.0.242:8080/upload\",
    \"timesFile\": \"times.json\"
    }
}"

