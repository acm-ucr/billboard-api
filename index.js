const
  base = process.cwd(),
  express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  {
    execute,
    subscribe,
  } = require('graphql'),
  {
    graphqlExpress,
    graphiqlExpress,
  } = require('apollo-server-express'),
  { createServer } = require('http'),
  { SubscriptionServer } = require('subscriptions-transport-ws'),
  schema = require(`${base}/schema`),
  connectMongo = require(`${base}/connectors/mongo`),
  { authenticate } = require(`${base}/authenticate`),
  port = process.env.PORT || 8888,
  start = async () => {
    const
      mongo = await connectMongo(),
      app = express(),
      buildOptions = async (req, res) => {
        return {
          context: {
            mongo,
          },
          schema,
        }
      }

      app.use(morgan('dev'));

      app.use('/graphql', bodyParser.json(), graphqlExpress(buildOptions));

      app.use('/graphiql', graphiqlExpress({
        endpointURL: '/graphql',
        subscriptionsEndpoint: `ws://localhost:${port}/subscriptions`,
      }));
      
      const server = createServer(app);
      server.listen(port, () => {
        new SubscriptionServer({
          execute,
          subscribe,
          schema,
        }, {
          server,
          path: '/subscriptions',
        });

        console.log(`Server Magic happens on port: ${port}`);
        console.log(`GraphiQL Magic happens on: ${port}/graphiql`);
      });
  };

start();
