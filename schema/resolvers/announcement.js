const
  base = process.cwd(),
  pubsub = require(`${base}/pubsub`);

module.exports = {
  Query: {
    getAnnouncements: async (root, { last }, { mongo: { Announcements }}) => {
      const cursor = Announcements.find({});

      if (last) {
        cursor.limit(last);
        cursor.skip(cursor.count() - last);
      }

      return await cursor.toArray();
    },
  },
  Mutation: {
    addAnnouncement: async (root, data, { mongo: { Announcements } }) => {
      const response = await Announcements.insert(data);

      data.id = response.insertedIds[0];
  
      console.log(data);      
      pubsub.publish('Announcement', {
        Announcement: {
          mutation: 'CREATED',
          node: data,
        },
      });

      return data;
    },
  },
  Subscription: {
    Announcement: {
      subscribe: () => pubsub.asyncIterator('Announcement'),
    },
  },
  Announcement: {
    id: root => root._id || root.id,
  },
}