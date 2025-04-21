import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function CompanyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Company Settings</h1>
      
      <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Company Information</h2>
        <form className="space-y-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-neutral-700 mb-1">
              Company Name
            </label>
            <Input
              id="companyName"
              type="text"
              defaultValue="SmartJoules"
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-neutral-700 mb-1">
              Website
            </label>
            <Input
              id="website"
              type="url"
              defaultValue="https://smartjoules.com"
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
              Company Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm"
              defaultValue="SmartJoules is a leading energy management company..."
            />
          </div>
          
          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-neutral-700 mb-1">
              Company Logo
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-neutral-100 rounded-lg flex items-center justify-center">
                <span className="text-neutral-400">Logo</span>
              </div>
              <Button variant="outline">Upload New Logo</Button>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </form>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">AI Persona Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Interview Style</h3>
              <p className="text-sm text-neutral-500">Configure how AI personas conduct interviews</p>
            </div>
            <Button variant="outline">Configure</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Role Templates</h3>
              <p className="text-sm text-neutral-500">Manage role-specific AI persona templates</p>
            </div>
            <Button variant="outline">Manage</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 