TAG="1.2.0.beta9"

docker build . -t  andonisalcedo/podinsights:$TAG
docker push andonisalcedo/podinsights:$TAG
