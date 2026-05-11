import { Routes, Route } from "react-router"
import Home from "./pages/Home"
import All from "./pages/All"
import AllCategories from "./pages/AllCategories"
import Category from "./pages/Category"
import RootLayout from "./layouts/RootLayout"

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<RootLayout/> }>
        <Route index element={<Home />} />
        <Route path='all' element={<All />} />
        <Route path='categories' >
          <Route index element={<AllCategories />} />
          <Route path=':id' element={<Category />} />
          </Route>
      </Route>
    </Routes>
  )
}

export default AppRoutes
