const { SchemaDirectiveVisitor } = require('graphql-tools');
const {
  DirectiveLocation,
  GraphQLDirective,
  defaultFieldResolver,
  GraphQLString,
} = require('graphql');
const { authenticate } = require('./utils');

module.exports = appSecret =>
  class HasRole extends SchemaDirectiveVisitor {
    static getDirectiveDeclaration(directiveName = 'hasRole') {
      return new GraphQLDirective({
        name: directiveName,
        locations: [DirectiveLocation.FIELD_DEFINITION],
        args: {
          role: { type: GraphQLString },
        },
      });
    }

    checkRole(userRole, requiredRoles) {
      return requiredRoles
        .split(',')
        .map(role => role.trim().toLowerCase())
        .includes(userRole.toLowerCase());
    }

    visitFieldDefinition(field) {
      const { resolve = defaultFieldResolver } = field;

      const hasResolveFn = field.resolve !== undefined;

      field.resolve = async (root, args, context, info) => {
        const user = authenticate(context, appSecret);
        const role = this.args.role;
        
        if (!user.role) {
          throw new Error(`Invalid token payload!`);
        }

        const hasRole = this.checkRole(user.role, role);

        if (!hasRole && !hasResolveFn) {
          return null;
        } else if (!hasRole) {
          throw new Error(
            `No Access Level`
          );
        }

        return resolve.call(this, root, args, { ...context, user }, info);
      };
    }
  };
