import { makeExecutableSchema } from '@graphql-tools/schema'
import { createYoga } from 'graphql-yoga'
import { resolvers } from './resolvers'
import { typeDefs } from './typeDefs'

const schema = makeExecutableSchema({
	typeDefs,
	resolvers,
})

export const yoga = createYoga({
	schema,
	graphqlEndpoint: '/graphql',
	landingPage: true,
})
