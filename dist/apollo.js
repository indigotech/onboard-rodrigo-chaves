"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var apollo_server_1 = require("apollo-server");
var apollo_server_core_1 = require("apollo-server-core");
var typeDefs = (0, apollo_server_1.gql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  type Query {\n    hello: String\n  }\n"], ["\n  type Query {\n    hello: String\n  }\n"])));
var resolvers = {
    Query: {
        hello: function () { return 'Hello World'; },
    },
};
var server = new apollo_server_1.ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [(0, apollo_server_core_1.ApolloServerPluginLandingPageLocalDefault)({ embed: true })],
});
server.listen().then(function (_a) {
    var url = _a.url;
    console.log("\uD83D\uDE80  Server ready at ".concat(url));
});
var templateObject_1;
//# sourceMappingURL=apollo.js.map