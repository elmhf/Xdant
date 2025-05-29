'use client'
import { useParams } from 'next/navigation'
import { useEffect, useState,useContext } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooth, Cross, Activity, Stethoscope, ClipboardList, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { DataContext } from './dashboard'

const ToothDetailsPage = () => {
const { data, ToothEditData } = useContext(DataContext);
  const { toothNumber } = useParams(11)
  const [toothData, setToothData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Find the tooth data from ObjecthestoriqData
    const teethData = ToothEditData?.hestoriqData?.[0]?.teeth || [];
    const foundTooth = teethData.find(t => t.toothNumber === parseInt(toothNumber))
    console.log(teethData.find(t => t.toothNumber === parseInt(toothNumber)),"foundTooth")

    // Find the edit data from ToothEditData
    const editData = ToothEditData?.toothEditData?.find(edit => edit.tooth === parseInt(toothNumber)) || {}
    
    if (foundTooth) {
      setToothData({
        ...foundTooth,
        ...editData
      })
    }
    setLoading(false)
  }, [toothNumber, ToothEditData])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!toothData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-muted-foreground">
        {/* <Tooth className="h-12 w-12 mb-4" /> */}
        <h2 className="text-2xl font-bold">Tooth {toothNumber} Not Found</h2>
        <p className="mt-2">The requested tooth data is not available</p>
      </div>
    )
  }

  const renderStatusBadge = () => {
    switch(toothData.category) {
      case 'Healthy':
        return <Badge variant="default">Healthy</Badge>
      case 'Treated':
        return <Badge variant="secondary">Treated</Badge>
      case 'Pathology':
        return <Badge variant="destructive">Pathology</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const renderGumHealthBadge = () => {
    switch(toothData.gumHealth) {
      case 'Healthy':
        return <Badge variant="default">Healthy</Badge>
      case 'Moderate Inflammation':
        return <Badge variant="destructive">Moderate Inflammation</Badge>
      case 'Severe Inflammation':
        return <Badge variant="destructive">Severe Inflammation</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          {/* <Tooth className="h-8 w-8 text-primary" /> */}
          Tooth {toothNumber} Details
        </h1>
        {renderStatusBadge()}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="problems" className="flex items-center gap-2">
            <Cross className="h-4 w-4" />
            Problems
          </TabsTrigger>
          <TabsTrigger value="treatment" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Treatment
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="position" className="flex items-center gap-2">
            {/* <Tooth className="h-4 w-4" /> */}
            Position
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Tooth Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-muted-foreground">Status</h3>
                    <p>{renderStatusBadge()}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">Gum Health</h3>
                    <p>{renderGumHealthBadge()}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">Last Checkup</h3>
                    <p>{new Date(toothData.lastCheckup).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-muted-foreground">Tooth Number</h3>
                    <p className="text-lg font-bold">{toothData.toothNumber}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">Position</h3>
                    <p>X: {toothData.position?.x || 'N/A'}, Y: {toothData.position?.y || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">Approval Status</h3>
                    <Badge variant={toothData.Approve ? 'default' : 'destructive'}>
                      {toothData.Approve ? 'Approved' : 'Not Approved'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="problems">
          <Card>
            <CardHeader>
              <CardTitle>Problems</CardTitle>
            </CardHeader>
            <CardContent>
              {toothData.problems?.length > 0 ? (
                <div className="space-y-4">
                  {toothData.problems.map((problem, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{problem.type}</h3>
                          <p className="text-muted-foreground">{problem.subtype}</p>
                        </div>
                        <Badge variant={problem.severity === 'High' ? 'destructive' : 'warning'}>
                          {problem.severity}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="font-medium text-muted-foreground">Size</h4>
                          <p>{problem.size || 'N/A'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-muted-foreground">Confidence</h4>
                          <p>{problem.confidence ? `${problem.confidence * 100}%` : 'N/A'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-muted-foreground">Detected At</h4>
                          <p>{problem.detectedAt ? new Date(problem.detectedAt).toLocaleString() : 'N/A'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-muted-foreground">Status</h4>
                          <p>{problem.status || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Cross className="h-12 w-12 mx-auto mb-4" />
                  <p>No problems detected for this tooth</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatment">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Information</CardTitle>
            </CardHeader>
            <CardContent>
              {toothData.problems?.some(p => p.treatedAt) ? (
                <div className="space-y-4">
                  {toothData.problems.filter(p => p.treatedAt).map((treatment, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{treatment.type}</h3>
                          <p className="text-muted-foreground">{treatment.subtype}</p>
                        </div>
                        <Badge variant={treatment.status === 'Successful' ? 'default' : 'destructive'}>
                          {treatment.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="font-medium text-muted-foreground">Treated At</h4>
                          <p>{new Date(treatment.treatedAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-muted-foreground">Confidence</h4>
                          <p>{treatment.confidence ? `${treatment.confidence * 100}%` : 'N/A'}</p>
                        </div>
                      </div>
                      {treatment.images?.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-muted-foreground mb-2">Images</h4>
                          <div className="flex gap-2">
                            {treatment.images.map((img, i) => (
                              <div key={i} className="border rounded-md p-1">
                                <Image
                                  src={img}
                                  alt={`Treatment ${index + 1} image ${i + 1}`}
                                  width={80}
                                  height={80}
                                  className="rounded-md object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Stethoscope className="h-12 w-12 mx-auto mb-4" />
                  <p>No treatment history available for this tooth</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Tooth Images</CardTitle>
            </CardHeader>
            <CardContent>
              {toothData.problems?.some(p => p.images?.length > 0) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {toothData.problems.flatMap((problem, pIndex) => 
                    problem.images?.map((img, i) => (
                      <div key={`${pIndex}-${i}`} className="border rounded-lg overflow-hidden">
                        <Image
                          src={img}
                          alt={`Problem ${pIndex + 1} image ${i + 1}`}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-3">
                          <h4 className="font-medium">{problem.type}</h4>
                          <p className="text-sm text-muted-foreground">
                            {problem.detectedAt ? new Date(problem.detectedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4" />
                  <p>No images available for this tooth</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Treatment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {ObjecthestoriqData?.[0]?.info?.medicalHistory
                  ?.filter(h => h.description.includes(`Tooth ${toothNumber}`))
                  .map((history, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold">{history.description}</h3>
                          <p className="text-muted-foreground">{history.clinic}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(history.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4" />
                    <p>No medical history available for this tooth</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="position">
          <Card>
            <CardHeader>
              <CardTitle>Tooth Position</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Coordinates</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">X Position</p>
                      <p className="font-bold">{toothData.position?.x || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Y Position</p>
                      <p className="font-bold">{toothData.position?.y || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Bounding Box</h3>
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(toothData.boundingBox, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ToothDetailsPage