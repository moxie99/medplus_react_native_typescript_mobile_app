import { Link, Stack, useLocalSearchParams } from 'expo-router'
import { TouchableOpacity, View, Pressable, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import { FontAwesome } from '@expo/vector-icons'
import { useCartStore } from '../../store/cart-store'
export default function CategoryLayout() {
  const { slug } = useLocalSearchParams()
  const [title, setTitle] = useState('Category Loading...')
  const { getItemCount } = useCartStore()

  useEffect(() => {
    if (slug) {
      const formattedSlug =
        slug?.charAt(0).toUpperCase() + slug.slice(1)?.toLowerCase()
      setTitle(`${formattedSlug} Category`)
    } else {
      setTitle('Category Loading...')
    }
  }, [slug])

  return (
    <Stack>
      <Stack.Screen
        name='[slug]'
        options={({ navigation }) => ({
          headerShown: true,
          title,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name='arrow-back' size={24} color='black' />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <Link style={{ padding: 10 }} href='/cart' asChild>
              <Pressable>
                {({ pressed }) => (
                  <View>
                    <FontAwesome
                      name='shopping-cart'
                      size={25}
                      color='gray'
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />

                    <View
                      style={{
                        position: 'absolute',
                        top: -5,
                        right: 10,
                        backgroundColor: '#ff0077',
                        borderRadius: 10,
                        width: 20,
                        height: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 'bold',
                        }}
                      >
                        {getItemCount()}
                      </Text>
                    </View>
                  </View>
                )}
              </Pressable>
            </Link>
          ),
        })}
      />
    </Stack>
  )
}
