/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateComment = /* GraphQL */ `
  subscription OnCreateComment($owner: String) {
    onCreateComment(owner: $owner) {
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
export const onUpdateComment = /* GraphQL */ `
  subscription OnUpdateComment($owner: String) {
    onUpdateComment(owner: $owner) {
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
export const onDeleteComment = /* GraphQL */ `
  subscription OnDeleteComment($owner: String) {
    onDeleteComment(owner: $owner) {
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
