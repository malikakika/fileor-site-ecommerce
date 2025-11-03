import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from '../context/cartContext';
import Header from '../components/header';
import HomePage from '../pages/homePage';
import ProductEditorPage from '../pages/products/productEditorPage';
import ContactPage from '../pages/contactPage';
import AboutPage from '../pages/aboutPage';
import CartPage from '../pages/cartPage';
import Footer from '../components/footer';
import LoginPage from '../pages/loginPage';
import RegisterPage from '../pages/registerPage';
import AccountPage from '../pages/accountPage';
import AdminPage from '../pages/admin/adminPage';
import ProductsPage from '../pages/products/ProductsPage';
import ChatPage from '../pages/chatPage';
import ThankYouPage from '../pages/thankYouPage';
import CheckoutCODPage from '../pages/checkoutCODPage';
import { CurrencyProvider } from '../context/currencyContext';
import RequireAuth from '../components/requireAuth';
import ProductDetails from '../pages/products/ProductDetailsPage';
import FavoritesPage from '../pages/favoritesPage';
import { FavoritesProvider } from '../context/favoritesContext';

function App() {
  return (
    <CurrencyProvider>
      <CartProvider>
        <FavoritesProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Header />

              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route
                    path="/editor"
                    element={
                      <RequireAuth>
                        <ProductEditorPage />
                      </RequireAuth>
                    }
                  />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/product/:slug" element={<ProductDetails />} />

                  <Route
                    path="/cart"
                    element={
                      <RequireAuth>
                        <CartPage />
                      </RequireAuth>
                    }
                  />
                  <Route path="/favorites" element={<FavoritesPage />} />

                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/checkout/cod" element={<CheckoutCODPage />} />
                  <Route path="/checkout/success" element={<ThankYouPage />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </BrowserRouter>
        </FavoritesProvider>
      </CartProvider>
    </CurrencyProvider>
  );
}

export default App;
