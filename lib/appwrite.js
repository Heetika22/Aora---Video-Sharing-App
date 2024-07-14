import { Account, Avatars, Client, Databases, ID, Query , Storage} from 'react-native-appwrite';
import { config } from './appwriteConfig';

// appwrite Configurations

// export const config= {
//     endpoint: 'https://cloud.appwrite.io/v1',
//     platform: '',
//     projectId: '',
//     databaseId: '',
//     userCollectionId: '',
//     videoCollectionId: '',
//     savedVideoCollectionId:'',
//     storageId: '',
// }


// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint) // Your Appwrite Endpoint
    .setProject(config.projectId) // Your project ID
    .setPlatform(config.platform) // Your application ID or bundle ID.
;

const account = new Account(client);
const avatars= new Avatars(client);
const databases= new Databases(client);
const storage= new Storage(client);

// Register User
export const createUser= async (email, password, username) =>{
    try{
        const newAccount= await account.create(
            ID.unique(),
            email,
            password, 
            username
        )

        if(!newAccount) throw Error;

        const avatarUrl= avatars.getInitials(username);

        await signIn(email, password);

        const newUser= await databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email: email,
                username: username,
                avatar: avatarUrl
            }
        )

        return newUser;
    }catch(error){
        console.log(error);
        throw new Error(error);
    }
}

//function for signing in
export const signIn= async (email,password) =>{
    try{
        const session= await account.createEmailPasswordSession(email, password);
        return session;
    }catch(error){
        throw new Error(error);
    }
}

//function to fetch details of current user
export const getCurrentUser= async()=>{
    try{
        const currentAccount= await account.get();
        if(!currentAccount) throw error;

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountId', currentAccount.$id )]
        );

        if(!currentUser) throw Error;

        return currentUser.documents[0];
    }catch(error){
        console.log(error);
    }
}

export const getAllPosts= async ()=>{
    try{
        const posts= await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.orderDesc('$createdAt')]
        )

        return posts.documents;
    }catch(error){
        throw new Error(error);
    }
}

export const getLatestPosts= async ()=>{
    try{
        const posts= await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.orderDesc('$createdAt', Query.limit(7))]
        )

        return posts.documents;
    }catch(error){
        throw new Error(error);
    }
}

export const searchPosts= async (query)=>{
    try{
        const posts= await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.search('title', query)]
        )

        return posts.documents;
    }catch(error){
        throw new Error(error);
    }
}

export const getUserPosts= async (userId)=>{
    try{
        const posts= await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.equal('creator', userId), Query.orderDesc('$createdAt')]
        )

        return posts.documents;
    }catch(error){
        throw new Error(error);
    }
}

export const signOut = async ()=>{
    try {
        const session= await account.deleteSession('current');
        return session;
    }catch(error){
        throw new Error(error);
    }
}

export const getFilePreview= async (fileId, type) =>{
    let fileUrl;

    try {
        if(type === 'video'){
            fileUrl= storage.getFileView(config.storageId, fileId)
        }else if (type === 'image'){
            fileUrl= storage.getFilePreview(config.storageId, fileId, 2000, 2000, 'top', 100)
        }else{
            throw new Error("Invalid file type");
        }

        if(!fileUrl) throw Error;

        return fileUrl
    } catch (error) {
        throw new Error(error);
    }
}

export const uploadFile= async (file, type) =>{
    if(!file) return;

    const asset= {
        name: file.fileName,
        type: file.mimeType,
        size: file.fileSize,
        uri: file.uri,
    }

    console.log('FILE',file);

    try {
        const uploadedFile= await storage.createFile(
            config.storageId,
            ID.unique(),
            asset
        );
        console.log('uploaded file', uploadedFile)

        const fileUrl= await getFilePreview(uploadedFile.$id, type)
        return fileUrl;
    } catch (error) {
        throw new Error(error);
    }
}

export const createVideo= async (form) =>{
    try {
       const [thumbnailUrl, videoUrl]= await Promise.all([
        uploadFile(form.thumbnail, 'image'),
        uploadFile(form.video, 'video'),
        
        ]) 

        const newPost = await databases.createDocument(
            config.databaseId,
            config.videoCollectionId,
            ID.unique(),
            {
                title: form.title,
                thumbnail: thumbnailUrl,
                video: videoUrl,
                prompt: form.prompt,
                creator: form.userId
            }

        )
        return newPost;
    } catch (error) {
        throw new Error(error);
    }
}

//save video
export const saveVideo = async(userId, videoId )=> {
    try {
        const video= await databases.getDocument(
            config.databaseId,
            config.videoCollectionId,
            videoId,
        );
        const savedBy= video.saved_by || [];

        if(!savedBy.includes(userId)){
            savedBy.push(userId);

            await databases.updateDocument(
                config.databaseId,
                config.videoCollectionId,
                videoId, 
                { saved_by: savedBy },
            );

            console.log('Video saved successfully. Updated saved_by:', savedBy);
        }else {
            console.log('Video is already saved by the user');
        }

    } catch (error) {
       console.error('Error saving video:', error); 
    }

}

//unsave video
export const unsaveVideo= async(userId, videoId) =>{
    try {
        const video= await databases.getDocument(
            config.databaseId,
            config.videoCollectionId,
            videoId,
        );

       // Log the fetched video and the saved_by array
       console.log('Fetched video:', video);
       console.log('Original saved_by:', video.saved_by);

       // Check if the video exists and if it has a saved_by array
       if (video && Array.isArray(video.saved_by)) {
           // Remove the user ID from the saved_by array
           const savedBy = video.saved_by.filter(user => user.$id !== userId);

           // Log the updated saved_by array
           console.log('Updated saved_by:', savedBy);

           // Update the video document with the new saved_by array
           await databases.updateDocument(
               config.databaseId,
               config.videoCollectionId,
               videoId,
               { saved_by: savedBy },
           );

            console.log(`Video ${videoId} unsaved successfully for user ${userId} -- Videos Collection`);
        }else {
            console.log('Video not found or user has not saved the video');
        }
        
    } catch (error) {
        console.error('Error unsaving video:', error);
    }
}


//delete video
export const deleteVideo= async(videoId) => {
    try {
        await databases.deleteDocument(
            config.databaseId,
            config.videoCollectionId,
            videoId
        );
            console.log('Deleted all entries related to video');
    } catch (error) {
        console.error('Error deleting video:', error);
    }
}

//fetch saved videos
export const fetchSavedVideos= async(userId) => {
    try {
        const posts= await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId
        )
        console.log('Fetched videos:', posts.documents);
        

        // Filter videos by the saved_by attribute
        const savedVideos = posts.documents.filter(video => {
            const savedBy = video.saved_by || [];
            console.log(`Filtering video ID: ${video.$id}, savedBy array:`, savedBy);
            return savedBy.some(user => user.$id === userId);
        });

        console.log('Filtered saved videos:', savedVideos);

        return savedVideos;
    } catch (error) {
        console.error('Error fetching saved videos:', error);
        return [];
    }
}


