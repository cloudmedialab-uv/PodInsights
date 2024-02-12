TAG="1.0.1"

docker build . -t routerdi1315.uv.es:33443/cloudmedialab/podinsights:$TAG
docker push routerdi1315.uv.es:33443/cloudmedialab/podinsights:$TAG
