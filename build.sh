TAG="1.1.0.beta5"

docker build . -t  andonisalcedo/podinsights:$TAG
docker push andonisalcedo/podinsights:$TAG
