const env = {
    redis: {
        // address: "172.17.93.129"
        address: "192.168.1.102"
    },
    neo4j: {
        address: "bolt://localhost:7687",
        user: "neo4j",
        password: "123mudar"
    },
    twitter: {
        api_key: "VflIwo8wlnHqXVmb0DMVGdztR",
        secret_key: "IoSBXujJUlwaFDRE6oKmOBFBnZBe8B0lPH219rl6BsXtl9m1gE",
        url: {
            sync: "https://api.twitter.com/1.1/followers/list.json",
            login: "https://api.twitter.com/oauth2/token"
        }
    }
}

module.exports = env;