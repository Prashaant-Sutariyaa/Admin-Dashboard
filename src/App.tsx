import { RouterProvider } from 'react-router';
import router from './routes/Router';
import './styles/globals.css';
import { ThemeProvider } from './theme/theme-provider';
import ToasterWithTheme from './components/shared/toast/ToasterWithTheme';



function App() {
  console.log('App rendered');
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
      <ToasterWithTheme />
    </ThemeProvider>
  );
}


export default App;
