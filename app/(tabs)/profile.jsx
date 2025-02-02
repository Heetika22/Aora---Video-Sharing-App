import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View , RefreshControl} from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import EmptyState from '../../components/EmptyState'
import {  getUserPosts, searchPosts, signOut } from '../../lib/appwrite'
import useAppwrite from '../../lib/useAppwrite'
import VideoCard from '../../components/VideoCard'
import {useGlobalContext} from '../../context/GlobalProvider'
import { icons } from '../../constants'
import InfoBox from '../../components/InfoBox'
import { router } from 'expo-router'
import { useState } from 'react'


const Profile = () => {
  const {user, setUser, setIsLoggedIn} = useGlobalContext();

  const {data: posts, refetch} = useAppwrite(() => getUserPosts(user.$id));
  //console.log(posts);

  const[refreshing, setRefreshing]= useState(false);
  const onRefresh= async () =>{
    setRefreshing(true);
    //re call videos if any new videos come
    await refetch();
    setRefreshing(false);
  }
  
  const logout= async () => {
    await signOut();
    setUser(null);
    setIsLoggedIn(false);

    router.replace('/sign-in')
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <StatusBar backgroundColor='#161622' style="light"></StatusBar>
      <FlatList 
        data={posts}
        keyExtractor={(item)=>item.$id}
        renderItem={({item}) => (
            <VideoCard video={item} context='profile'/>
        )}
        ListHeaderComponent={() => (
          <View className="w-full justify-center items-center mt-6 mb-12 px-4"> 
            <TouchableOpacity className="w-full items-end mb-10" onPress={logout}>
              <Image source={icons.logout} resizeMode='contain' className="w-6 h-6"/>
            </TouchableOpacity>
            <View className="w-16 h-16 border border-secondary rounded-xl justify-center items-center">
            <Image source={{uri : user?.avatar}} resizeMode='contain' className="w-[90%] h-[90%] rounded-lg"/>
            </View>

            <InfoBox 
              title={user?.username}
              containerStyles='mt-5'
              titleStyles= 'text-lg'
            />

            <View className= "mt-5 flex-row">
              <InfoBox 
                title={posts.length || 0}
                subtitle="Posts"
                containerStyles='mr-10 '
                titleStyles= 'text-xl'
              />

              <InfoBox 
              title= "500"
              subtitle= "Followers"
              titleStyles= 'text-xl'
            />
            </View>
          </View>
        )}

        ListEmptyComponent={() => (
          <EmptyState title="No Videos Found" subtitle="No videos found for this search query" />
        )}

        refreshControl={<RefreshControl refreshing= {refreshing} onRefresh={onRefresh}/>}
      />
    </SafeAreaView>
  )
}

export default Profile

const styles = StyleSheet.create({})