import { createYoga } from 'graphql-yoga'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { typeDefs } from './typeDefs'
import { resolvers } from './resolvers'

const schema = makeExecutableSchema({
	typeDefs,
	resolvers,
})

export const yoga = createYoga({
	schema,
	graphqlEndpoint: '/graphql',
	landingPage: true,
})
