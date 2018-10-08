const { SchemaDirectiveVisitor } = require('graphql-tools');
const {
  DirectiveLocation,
  GraphQLDirective,
  defaultFieldResolver,
} = require('graphql');
const { authenticate } = require('./utils');

module.exports = appSecret =>
  class isAdmin extends SchemaDirectiveVisitor {
    static getDirectiveDeclaration(directiveName = 'isAdmin') {
      return new GraphQLDirective({
        name: directiveName,
        locations: [DirectiveLocation.FIELD_DEFINITION],
      });
    }

    visitFieldDefinition(field) {
      const { resolve = defaultFieldResolver } = field;

      field.resolve = async (root, args, context, info) => {
        const user = authenticate(context, appSecret);

        if (!user.is_admin) {
          throw new Error(`You must be admin to perform this action`);
        }

        return resolve.call(this, root, args, context, info);
      };
    }
  };
