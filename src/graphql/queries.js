/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getComment = /* GraphQL */ `
  query GetComment($id: ID!) {
    getComment(id: $id) {
      id
      userId
      username
      text
      trailId
      waypointId
      visible
      revised
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listComments = /* GraphQL */ `
  query ListComments(
    $filter: ModelCommentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listComments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        username
        text
        trailId
        waypointId
        visible
        revised
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
