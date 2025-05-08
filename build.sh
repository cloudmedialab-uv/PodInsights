TAG="1.3.0graf.alpha3"

docker build . -t  andonisalcedo/podinsights:$TAG
docker push andonisalcedo/podinsights:$TAG
