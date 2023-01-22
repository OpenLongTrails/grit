/***********************************************************************************************
 *
 *   Grit, Copyright 2022 OpenLongTrails.org.
 *
 *   This file is part of OpenLongTrails Grit.
 *
 *   OpenLongTrails Grit is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 *   OpenLongTrails Grit is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License along with OpenLongTrails Grit. If not, see <https://www.gnu.org/licenses/>. 
 *
 ***********************************************************************************************/

import { API, graphqlOperation } from 'aws-amplify';
import { createComment } from './graphql/mutations';
import { listComments } from './graphql/queries';
import { deleteFile, getFileInfo, loadFile, writeFile } from './Utils_Files';
import { internetIsReachable } from './Utils_Network';
import * as globals from './Globals';

export async function loadComments() {
  console.log("=== loadComments(): at loadComments()...");

  let commentsFileExists = await getFileInfo('comments.json');

  if (commentsFileExists.exists === true) {
    console.log("=== loadComments(): comments.json found, attempting to load comments...");

    let commentsData = await loadFile('comments.json');
    globals.comments = JSON.parse(commentsData);
  } else {
    console.log("=== loadComments(): comments.json not found, attempting to fetch from cloud...");
    console.log("=== loadComments(): calling await fetchComments()");

    fetchCommentsResult = await fetchComments();

    console.log("=== loadComments(): calling await writeCommentsToDisk()");
    writeCommentsToDiskResult = await writeCommentsToDisk();
  }

  console.log("=== loadComments(): Array.isArray(globals.comments): ", Array.isArray(globals.comments));
  console.log("=== loadComments(): globals.comments: ", JSON.stringify(globals.comments).substring(0, 100));
}

export async function fetchComments() {
  if (await internetIsReachable() == false) {
    Alert.alert(
      "",
      "Unable to contact server.",
      [{ text: "OK", onPress: () => console.log("=== OK Pressed") }]
    );
  } else {
    console.log("=== fetchComments(): at fetchComments().");

    console.log("=== fetchComments(): calling await API.graphql(graphqlOperation(listComments))");
    try {
      const commentData = await API.graphql(graphqlOperation(listComments));

      // console.log("=== fetchComments(): calling JSON.parse(commentData.data.listComments.items)");
      // console.log("=== isArray: ", Array.isArray(commentData.data.listComments.items));

      globals.comments = commentData.data.listComments.items;

      console.log("=== fetchComments(): fetched comments: " + JSON.stringify(globals.comments));
    } catch (err) {
      globals.log.error("API.graphql returned error on listComments: ", err);
      console.log("!!! API.graphql() returned error on listComments: ", err);
    }
  }
}

export async function writeCommentsToDisk() {
  console.log("=== writeCommentsToDisk(): writing comments to file...");
  console.log("=== writeCommentsToDisk(): globals.comments: ", globals.comments);

  await writeFile("comments.json", globals.comments);
}

export async function fetchAndSaveComments() {
  try {
    console.log("=== fetchAndSaveComments(): At fetchAndSaveComments()...");

    console.log("=== fetchAndSaveComments(): calling await fetchComments()");
    await fetchComments();

    console.log("=== fetchAndSaveComments(): calling await writeCommentsToDisk()");
    await writeCommentsToDisk();
  } catch (err) { console.log('=== error in fetchAndSaveComments(): ', err) }
}

export async function uploadLocalComments() {
  let commentsFileExists = await getFileInfo('toUploadComments.json');

  if (commentsFileExists.exists === false) {
    console.log("=== uploadLocalComments(): toUploadComments.json not found.");
  } else {
    if (await internetIsReachable() == false) {
      Alert.alert(
        "",
        "Unable to contact server.",
        [{ text: "OK", onPress: () => console.log("=== OK Pressed") }]
      );
    } else {
      let errorUploadingComment = false;

      // Load current toUploadComments.json.
      let toUploadComments = await loadToUploadComments();

      console.log("=== returned from loadToUploadComments(). toUploadComments: ", JSON.stringify(toUploadComments));
      console.log("=== calling graphql createComment...");

      // TODO: In the following try/catch, if there are multiple comments and less than all of them fail to write, all of the comments will be
      //       rewritten on the next sync, leading to some duplicated comments.

      // Send current toUploadComments.
      toUploadComments.map(async (comment) => {
        try {
          let writeResult = await API.graphql(graphqlOperation(createComment, { input: comment }));
        } catch (err) {
          console.log("!!! uploadLocalComments(): API.graphql() returned error on comment write: ", JSON.stringify(comment) + " / " + err);
          globals.log.error("API.graphql() returned error on comment write: ", JSON.stringify(comment) + " / " + err);
          errorUploadingComment = true;
        }
      });

      if (errorUploadingComment == false) {
        await deleteFile("toUploadComments.json");
      }
    }
  }
}

export async function loadToUploadComments() {
  let toUploadCommentsData = await loadFile('toUploadComments.json');
  let toUploadComments = JSON.parse(toUploadCommentsData);

  console.log("=== toUploadComments.json loaded: ", toUploadComments);
  return (toUploadComments);
}

export async function syncCommentsWithCloud() {
  console.log("=== syncCommentsWithCloud(): at syncCommentsWithCloud().");

  console.log("=== syncCommentsWithCloud(): calling await uploadLocalComments().");
  await uploadLocalComments();

  console.log("=== syncCommentsWithCloud(): calling fetchAndSaveComments()...");
  await fetchAndSaveComments();
}

export async function logToUploadComments() {
  let commentsFileExists = await getFileInfo('toUploadComments.json');

  if (commentsFileExists.exists === false) {
    console.log("=== toUploadComments.json not found.\n");
  } else {
    let toUploadCommentsStr = await loadToUploadComments();
    let toUploadComments = JSON.parse(toUploadCommentsStr);

    console.log("=== toUploadComments.length: ", toUploadComments.length);
    toUploadComments.map((comment) => { console.log("=== toUploadComments: ", comment, "\n") });
  }
}

export async function deleteToUploadComments() {
  let commentsFileExists = await getFileInfo('toUploadComments.json');

  if (commentsFileExists.exists === false) {
    console.log("=== deleteToUploadComments(): toUploadComments.json not found.");
  } else {
    await deleteFile("toUploadComments.json");
    console.log("=== deleteToUploadComments(): toUploadComments.json deleted.");
  }
}

export function logComments() {
  console.log("=== logComments().");

  globals.comments.map(comment => console.log("=== " + comment));
}
