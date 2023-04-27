import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header/Header.jsx'
import Banner from './components/Banner/Banner.jsx'
import Hero from './components/Hero/Hero.jsx';
import Skills from './components/Skills/Skills.jsx';
import Proyects from './components/Projects/Projects.jsx';
import Contact from './components/Contact/Contact.jsx';
import Footer from './components/Footer/Footer.jsx';


function App() {

  return (
    <div className="App">
      <Header />
      <Banner />
      <Hero />
      <Skills />
      <Proyects />
      <Contact />
      <Footer />
    </div>
  )
}

export default App
