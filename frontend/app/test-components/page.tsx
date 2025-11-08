import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TestComponentsPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Phase 1 Foundation Components Test</h1>
      
      {/* Button Component Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Button Component</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="link">Link Button</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button size="sm">Small Button</Button>
          <Button size="default">Default Size</Button>
          <Button size="lg">Large Button</Button>
        </div>
      </section>

      {/* Card Component Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Card Component</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>This is a card description</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is the card content area where main information goes.</p>
            </CardContent>
            <CardFooter>
              <Button>Action</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Another Card</CardTitle>
              <CardDescription>Testing multiple cards</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Cards can contain any content and are fully customizable.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Input and Label Component Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Input & Label Components</h2>
        <Card>
          <CardHeader>
            <CardTitle>Form Example</CardTitle>
            <CardDescription>Testing input and label components together</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" type="text" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disabled">Disabled Input</Label>
              <Input id="disabled" type="text" placeholder="Disabled" disabled />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Submit</Button>
          </CardFooter>
        </Card>
      </section>

      {/* Combined Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Combined Components</h2>
        <Card>
          <CardHeader>
            <CardTitle>Login Form</CardTitle>
            <CardDescription>All foundation components working together</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email Address</Label>
              <Input id="login-email" type="email" placeholder="teacher@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input id="login-password" type="password" placeholder="••••••••" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button>Sign In</Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  )
}
