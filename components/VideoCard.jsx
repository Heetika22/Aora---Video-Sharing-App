import { View, Text, Image, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { icons } from '../constants'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Video, ResizeMode} from 'expo-av'
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import {useGlobalContext} from '../context/GlobalProvider'
import { deleteVideo, saveVideo, unsaveVideo } from '../lib/appwrite';


const VideoCard = ({video: {$id:videoId ,title, thumbnail, video, creator:{username, avatar}}, context }) => {
    
    const {user}= useGlobalContext();
    const [loading, setLoading] = useState(false);
    const [play, setPlay] = useState(false);
    const handleTogglePlay = () => {
        setPlay(!play);
    };

    const handleSave = async() => {
        setLoading(true);
        try {
           await saveVideo(user.$id, videoId);
           console.log("saved video succesfully")
        } catch (error) {
           Alert.alert("Error", "Error saving the video") 
        }finally{
            setLoading(false);
        }
    };

    const handleUnsave = async() => {
        setLoading(true);
        try {
            await unsaveVideo(user.$id, videoId);
            console.log("video unsaved succesfully")
        } catch (error) {
            Alert.alert("Error", "Error unsaving the video")
        }finally{
            setLoading(false);
        }
        
    };

    const handleDelete = async() => {
        // Implement delete functionality
        setLoading(true);
        try {
            await deleteVideo(videoId);
            console.log("deleted video succesfully")
        } catch (error) {
            Alert.alert("Error", "Error deleting the video")
        }finally{
            setLoading(false);
        }
    };

    return (
    <View className="flex-col items-center px-4 mb-14">
        <View className="flex-row gap-3 items-start">
            <View className="justify-center items-center flex-row flex-1">
                <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
                    <Image source={{uri: avatar}} resizeMode='cover' className="w-full h-full rounded-lg"/>
                </View>

                <View className="justify-center flex-1 ml-3 gap-y-1">
                    <Text className="text-white font-psemibold text-sm" numberOfLines={1}>
                        {title}
                    </Text>
                    <Text className="text-xs text-gray-100 font-pregular" numberOfLines={1}>
                        {username}
                    </Text>
                </View>

                {/* <View className="pt-2">
                    <Image source={icons.menu} className="w-5 h-5" resizeMode='contain' />
                    <Icon size={24} color="white" name="bookmark" />
                </View> */}
                <View className="pt-2">
                    <Menu>
                        <MenuTrigger>
                            <Image source={icons.menu} className="w-5 h-5" resizeMode='contain' />
                        </MenuTrigger>
                        <MenuOptions 
                            customStyles={{
                                optionsContainer: {
                                    backgroundColor: "#232533",
                                    borderRadius: 10,
                                    width: 150,
                                },
                            }}
                        >
                            {context === 'home' && (
                                <MenuOption onSelect={handleSave}>
                                    <View className="flex-row p-3">
                                        <Icon size={24} color="white" name="bookmark"  />
                                    <Text className="text-gray-100 font-pmedium ml-3 text-base">save</Text>
                                    </View>
                                </MenuOption>
                            )}
                            {context === 'savedVideos' && (
                                <MenuOption onSelect={handleUnsave}>
                                    <View className="flex-row p-3">
                                        <Icon size={24} color="white" name="bookmark-off"  />
                                        <Text className="text-gray-100 font-pmedium ml-5 text-base">unsave</Text>
                                    </View>
                                </MenuOption>
                            )}
                            {context === 'profile' && (
                                <MenuOption onSelect={handleDelete}>
                                    <View className="flex-row p-3">
                                        <Icon size={24} color="white" name="delete"  />
                                        <Text className="text-gray-100 font-pmedium ml-5 text-base">delete</Text>
                                    </View>
                                </MenuOption>
                            )}
                        </MenuOptions>
                    </Menu>
                </View>
            </View>         
        </View>
        {play ? (
               <Video source={{uri: video }} className="w-full h-60 rounded-xl mt-3 "
               resizeMode={ResizeMode.CONTAIN} 
               useNativeControls 
               shouldPlay 
               onPlaybackStatusUpdate={(status) =>{
                 if(status.didJustFinish){
                   setPlay(false);
                 }
               }}
             />
   
            ): (
                <TouchableOpacity activeOpacity={0.7} onPress={handleTogglePlay} className="w-full h-60 rounded-xl mt-3 relative justify-center items-center">
                    <Image source={{uri: thumbnail}} className="w-full h-full rounded-xl mt-3" resizeMode='cover'/>
                    <Image source={icons.play} className="w-12 h-12 absolute" resizeMode='contain'/>
                </TouchableOpacity>
            )}
    </View>
  )
}

export default VideoCard