TAG="1.2.0"

docker build . -t cloudmedialab/podinsights:$TAG
docker push cloudmedialab/podinsights:$TAG
