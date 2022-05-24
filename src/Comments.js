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

import React, { useState } from 'react';
import { Button, SafeAreaView, Text, TextInput, View } from 'react-native';
import { getFileInfo, loadFile, writeFile } from './Utils_Files';
import { CommentItem } from './CommentItem';
import { getRandomInt } from './Utils_Math';
import * as globals from './Globals';
import { styles } from './Styles';

export const Comments = ({ waypointId, commentEntryField }) => {
  const [userComment, setUserComment] = React.useState('');
  const [savedMessageIsVisible, setSavedMessageIsVisible] = React.useState(false);

  let displayComments = globals.comments.filter((comment) => { return comment.waypointId === waypointId });  //waypointcomments.waypoints.find(item => { return item.waypointid == waypointid }).comments;

  displayComments.sort((a, b) => { return new Date(a.createdAt) < new Date(b.createdAt) });

  console.log("=== Comments: waypointId: ", waypointId);
  console.log("=== Comments: displayComments: ", JSON.stringify(displayComments));

  const saveComment = async () => {
    if (userComment !== "") {
      let commentsFileExists = await getFileInfo('toUploadComments.json');

      if (commentsFileExists.exists === false) {
        console.log("=== creating empty file: toUploadComments.json");
        let t1 = [];
        let result = await writeFile('toUploadComments.json', t1);
      }

      let toUploadComments = await loadFile('toUploadComments.json');
      console.log("=== toUploadComments: " + toUploadComments);

      if (toUploadComments === '[]') {
        parsedToUploadComments = [];
      } else {
        parsedToUploadComments = JSON.parse(toUploadComments);
      }

      let thisComment = {
        "waypointId": waypointId,
        "text": userComment,
        "trailId": globals.appSettings.selectedTrail,
        "userId": globals.currentUser.userId,
        "username": globals.currentUser.username
      };

      parsedToUploadComments.push(thisComment);

      console.log("=== saveComment(): parsedToUploadComments: " + JSON.stringify(parsedToUploadComments));
      console.log("=== saveComment(): calling writeFile('toUploadComments.json', parsedToUploadComments);");
      await writeFile('toUploadComments.json', parsedToUploadComments);

      // Add placeholder values only to the copy of this comment that is appended to comments. Later, when toUploadComments.json is synced and
      // comments is reloaded, this comment will have the .id and .createdAt values assigned by DynamoDB.
      console.log("=== saveComment(): adding placeholder values thisComment.id and thisComment.createdAt.");
      thisComment.id = getRandomInt(1, 1000000);
      thisComment.createdAt = new Date();
      console.log("=== saveComment(): updated thisComment: ", JSON.stringify(thisComment));

      globals.comments = [...globals.comments, thisComment];

      console.log("=== saveComment(): updated comments: ", JSON.stringify(globals.comments));

      // Clear the TextInput.
      setUserComment('');
      // Show the 'Comment saved' message.
      setSavedMessageIsVisible(true);
    }
  }

  const renderItem = ({ item }) => {
    return (
      <View style={{ padding: 5, marginVertical: 10, marginHorizontal: 16 }}>
        <Text style={{ fontSize: 18 }}>{item.text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {commentEntryField &&
        <>
          <TextInput
            multiline={true}
            maxLength={500}
            numberOfLines={4}
            onChangeText={(text) => setUserComment(text)}
            placeholder={"Enter your comment here."}
            value={userComment}
            style={{
              margin: 12,
              borderWidth: 1,
              padding: 10,
              textAlignVertical: 'top'
            }}
          />

          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginRight: 50 }}>
            {savedMessageIsVisible &&
              <Text style={{ fontSize: 16, margin: 5 }}>
                {"Saved. Remember to sync."}
              </Text>
            }

            <Button
              title="Save"
              onPress={saveComment}
            />
          </View>
        </>
      }

      {displayComments.map(item => <CommentItem item={item} key={item.id} />)}
    </SafeAreaView>
  );
}
