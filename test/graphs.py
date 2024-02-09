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

""" filepaths = [
    "data/dockerStats1.json",
    "data/stats1.json",

] """


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
        print(cpu_data)
        cpu_data = [elemento for elemento in cpu_data if elemento is not None]
        cpu_data = list(map(lambda x: 100 if x > 100 else x,cpu_data))
        plt.plot(cpu_data, linestyle="-")
        plt.ylabel("CPU %", fontsize=24)
        plt.xlabel("Samples", fontsize=24)
        plt.xticks(fontsize=20)
        plt.yticks(fontsize=20)
        plt.tight_layout()
        #plt.show()
        plt.savefig(f"{dir}_{name}.png")
        plt.close()
