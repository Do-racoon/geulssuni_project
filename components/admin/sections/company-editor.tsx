export default function CompanyEditor() {
  return (
    <div>
      <h1 className="text-2xl font-light mb-8">Company Page Editor</h1>
      <div className="bg-white p-6 rounded-md shadow-sm">
        <p className="text-gray-500">
          Company page editor interface would go here, allowing administrators to update the company introduction page.
        </p>
        <p className="text-gray-500 mt-4">Features would include:</p>
        <ul className="list-disc ml-6 mt-2 text-gray-500">
          <li>Uploading/editing company logo and intro image</li>
          <li>Editing company description and mission statement</li>
          <li>Managing author profiles</li>
          <li>Adding/editing portfolio items</li>
          <li>Previewing company page</li>
        </ul>
      </div>
    </div>
  )
}
