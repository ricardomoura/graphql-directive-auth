const { SchemaDirectiveVisitor } = require('graphql-tools');
const {
  DirectiveLocation,
  GraphQLDirective,
  defaultFieldResolver,
} = require('graphql');
const { authenticate } = require('./utils');

module.exports = appSecret =>
  class isCustomer extends SchemaDirectiveVisitor {
    static getDirectiveDeclaration(directiveName = 'isCustomer') {
      return new GraphQLDirective({
        name: directiveName,
        locations: [DirectiveLocation.FIELD_DEFINITION],
      });
    }

    visitFieldDefinition(field) {
      const { resolve = defaultFieldResolver } = field;

      field.resolve = async (root, args, context, info) => {
        const user = authenticate(context, appSecret);

        if (!!user.is_admin && user.role !== 'customer') {
          throw new Error(`You must be registered customer to perform this action`);
        }

        return resolve.call(this, root, args, context, info);
      };
    }
  };
