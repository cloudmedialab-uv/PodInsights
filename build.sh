TAG="0.0.5"

docker build . -t cloudmedialab/podinsights:$TAG

docker tag cloudmedialab/podinsights:$TAG routerdi1315.uv.es:33443/cloudmedialab/podinsights:$TAG

docker push routerdi1315.uv.es:33443/cloudmedialab/podinsights:$TAG