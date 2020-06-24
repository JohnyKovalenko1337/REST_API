const { buildSchema } = require('graphql');

module.exports = buildSchema(`
type RootQuery{
    hello: String
}
schema{
    query: RootQuery
}
`)