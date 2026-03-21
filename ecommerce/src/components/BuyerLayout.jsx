import Navbar from './Navbar'
import Footer from './Footer'

// children = the actual page content passed between the tags
// e.g. <BuyerLayout><Home /></BuyerLayout>
function BuyerLayout({ children }) {
  return (
    <div className="buyer-layout">

      {/* Always on top */}
      <Navbar />

      {/* Page specific content goes here */}
      <main className="buyer-main">
        {children}
      </main>

      {/* Always at bottom */}
      <Footer />

    </div>
  )
}

export default BuyerLayout