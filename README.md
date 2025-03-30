PodInsights: Kubernetes Resource Monitoring System
==================================================

Introduction
------------

PodInsights is a centralized monitoring system for Kubernetes nodes. It deploys a daemonset across each node to monitor Kubernetes resources marked with a configurable label. PodInsights offers millisecond-level monitoring and can measure CPU and memory usage more precisely than traditional tools.


Features
--------

*   **High-Resolution Monitoring**: Track CPU and memory usage at the millisecond level.
*   **Daemonset Deployment**: Ensures comprehensive coverage across all Kubernetes nodes.
*   **Configurable Monitoring**: Users can specify which resources to monitor using configurable labels.
*   **Internal Database Storage**: Metrics are stored in an internal MongoDB database for efficient data management.
*   **API Access**: Provides an API for querying stored statistics. Documentation is available at [API Documentation](https://github.com/cloudmedialab-uv/PodInsights/wiki/API-REFERENCE).

Cite
------------

```json
{
  "@inproceedings": "10.1145/3685243.3685281",
  "author": "Navarro, Andoni Salcedo and Garcia-Pineda, Miguel and Gutierrez-Aguado, Juan",
  "title": "PodInsights: a millisecond pod metric collector for Kubernetes",
  "year": "2025",
  "isbn": "9798400717338",
  "publisher": "Association for Computing Machinery",
  "address": "New York, NY, USA",
  "url": "https://doi.org/10.1145/3685243.3685281",
  "doi": "10.1145/3685243.3685281",
  "articleno": "16",
  "numpages": "4",
  "keywords": "E-applications and case uses, Kubernetes, cloud computing, monitoring",
  "location": "Praia, Cape Verde",
  "series": "EATIS 2024"
}
```


Prerequisites
-------------

*   Kubernetes cluster
*   kubectl configured to communicate with your cluster

Installation
------------

1.  **Deploy PodInsights**:
    
    ```kubectl apply -f https://raw.githubusercontent.com/cloudmedialab-uv/PodInsights/main/deploy/k8s/metrics.yml```
    
    This command creates a dedicated namespace and sets up all necessary resources for PodInsights.
    
2.  **Configure Monitoring**: Edit the ConfigMap to set monitoring parameters like interval and labels.
    

Usage
-----

### Labeling Resources for Monitoring

To monitor a Kubernetes resource, add the `podkubemetrics: "true"` label. For example, to monitor an Nginx deployment:


```
apiVersion: apps/v1 
kind: Deployment 
metadata:   
    name: nginx   
    namespace: default    
spec:
    template:
    metadata:
      labels:
        podkubemetrics: "true"
```

### Querying Metrics

Use the provided API to query the metrics:

basic http request to get all metrics

`curl -X GET https://url.api.query/metrics`

example response:

```
[{
    "_id":"6548fcd0f1993657d9111307",
    "createdAt":1699282128096,
    "name":"k8s_user-container-0-deployment-7967975f5b",
    "memUsage":"2085126144",
    "memLimit":"101246816256",
    "cpuPercent":93.49533083645443,
    "nodeName":"worker13"
},
...]
```

* * *

For detailed API usage and documentation, please visit [API Documentation](https://github.com/cloudmedialab-uv/PodInsights/wiki/API-REFERENCE).
