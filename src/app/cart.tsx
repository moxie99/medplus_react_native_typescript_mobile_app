import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native'
import { useCartStore } from '../store/cart-store'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { createOrder, createOrderItem } from '../api/api'
import { openStripeCheckout, setupStripePaymentSheet } from '../lib/stripe'
import { useNavigation } from 'expo-router'
import { useEffect } from 'react'

type CartItemType = {
  id: number
  title: string
  heroImage: string
  price: number
  quantity: number
  maxQuantity: number
}

type CartItemProps = {
  item: CartItemType
  onRemove: (id: number) => void
  onIncrement: (id: number) => void
  onDecrement: (id: number) => void
}

const CartItem = ({
  item,
  onDecrement,
  onIncrement,
  onRemove,
}: CartItemProps) => {
  return (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.heroImage }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemPrice}>₦{item.price.toFixed(2)}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => onDecrement(item.id)}
            style={styles.quantityButton}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.itemQuantity}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => onIncrement(item.id)}
            style={styles.quantityButton}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onRemove(item.id)}
        style={styles.removeButton}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  )
}

export default function Cart() {
  const {
    items,
    removeItem,
    incrementItem,
    decrementItem,
    getTotalPrice,
    resetCart,
  } = useCartStore()
  const navigation = useNavigation()

  useEffect(() => {
    if (items?.length > 0) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Ionicons name='close' size={24} color='white' />
          </TouchableOpacity>
        ),
      })
    } else {
      navigation.setOptions({
        headerRight: () => null,
      })
    }
  }, [navigation, items])

  const { mutateAsync: createSupabaseOrder } = createOrder()
  const { mutateAsync: createSupabaseOrderItem } = createOrderItem()

  const handleCheckout = async () => {
    const totalPrice = parseFloat(getTotalPrice())

    try {
      await setupStripePaymentSheet(Math.floor(totalPrice * 100))
      const result = await openStripeCheckout()
      if (!result) {
        Alert.alert('An error occurred while processing the payment')
        return
      }

      await createSupabaseOrder(
        { totalPrice },
        {
          onSuccess: (data) => {
            createSupabaseOrderItem(
              items.map((item) => ({
                orderId: data.id,
                productId: item.id,
                quantity: item.quantity,
              })),
              {
                onSuccess: () => {
                  alert('Order created successfully')
                  resetCart()
                  navigation.goBack()
                },
              }
            )
          },
        }
      )
    } catch (error) {
      console.error(error)
      alert('An error occurred while creating the order')
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      {items?.length > 0 ? (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CartItem
              item={item}
              onRemove={removeItem}
              onIncrement={incrementItem}
              onDecrement={decrementItem}
            />
          )}
          contentContainerStyle={styles.cartList}
        />
      ) : (
        <View style={{ marginTop: 10, marginBottom: 10 }}>
          <Text
            style={{ textAlign: 'justify', fontWeight: '700', fontSize: 14 }}
          >
            Your cart is currently empty, kindly proceed to the shop to add to
            cart.
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.totalText}>Total: ₦{getTotalPrice()}</Text>

        <TouchableOpacity
          onPress={() => {
            items?.length > 0 ? handleCheckout() : navigation.goBack()
          }}
          style={styles.checkoutButton}
        >
          <Text style={styles.checkoutButtonText}>
            {items?.length > 0 ? 'Checkout' : 'Go to Shop'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  closeButton: {
    marginRight: 16,
    backgroundColor: '#ff0077',
    height: 28,
    width: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartList: {
    paddingVertical: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    color: '#888',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 8,
    backgroundColor: '#ff5252',
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  checkoutButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
})
