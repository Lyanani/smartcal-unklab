import Navbar from "./components/navbar";
import Hero from "./components/Hero";
import TicketList from "./components/TicketList";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      <Navbar />
      <main className="flex-1 p-8 max-w-6xl w-full mx-auto">
        <Hero />
        <TicketList />
        <Footer />
      </main>
    </div>
  );
}

export default App;