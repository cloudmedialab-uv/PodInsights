TAG="1.1.0.beta2"

docker build . -t  andonisalcedo/podinsights:$TAG
docker push andonisalcedo/podinsights:$TAG
