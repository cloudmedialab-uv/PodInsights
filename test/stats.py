import json
import matplotlib.pyplot as plt

# Leer el archivo

filepaths = [
    "stats20.json",
    "statsdocker20.json",
    "stats40.json",
    "statsdocker40.json",
    "stats60.json",
    "statsdocker60.json",
    "stats80.json",
    "statsdocker80.json",
]

filepaths = [
    "data/dockerStats1.json",
    "data/stats1.json",

]


for dir in filepaths:
    with open(dir, "r") as f:
        linea = f.readline()
        data = json.loads(linea)

    grouped_data = {}
    for obj in data:
        name = obj["pod"]
        cpu = obj["cpuPercent"]
        if name not in grouped_data:
            grouped_data[name] = []
        grouped_data[name].append(cpu)

    for name, cpu_data in grouped_data.items():
        print("Number of data: ", len(cpu_data))

        
