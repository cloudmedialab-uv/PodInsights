TAG="1.0.0"

docker build . -t  andonisalcedo/podinsights:$TAG
docker push andonisalcedo/podinsights:$TAG
