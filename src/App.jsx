import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/header'
import Banner from './components/banner'
import Hero from './components/hero';
import Skills from './components/skills';
import Proyects from './components/proyects';
import Contact from './components/contact';
import Footer from './components/footer';

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
