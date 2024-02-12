TAG="1.0.1"

docker build . -t cloudmedialab/podinsights:$TAG
docker push cloudmedialab/podinsights:$TAG
