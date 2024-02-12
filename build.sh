TAG="1.1.0"

docker build . -t cloudmedialab/podinsights:$TAG
docker push cloudmedialab/podinsights:$TAG
