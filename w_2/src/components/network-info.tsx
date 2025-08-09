'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wifi, Copy, ExternalLink } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function NetworkInfo() {
  const [ipAddresses, setIpAddresses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 在开发环境中，从主进程获取IP地址
    const fetchIPs = async () => {
      try {
        if (window.require) {
          const { ipcRenderer } = window.require('electron')
          const ips = await ipcRenderer.invoke('get-local-ip')
          setIpAddresses(ips)
        } else {
          // 在浏览器环境中，使用默认IP
          setIpAddresses(['192.168.1.100', '127.0.0.1'])
        }
      } catch (error) {
        console.error('Failed to get IP addresses:', error)
        setIpAddresses(['192.168.1.100', '127.0.0.1'])
      } finally {
        setLoading(false)
      }
    }

    fetchIPs()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: '已复制',
      description: `IP地址 ${text} 已复制到剪贴板`,
    })
  }

  const openInBrowser = (ip: string) => {
    window.open(`http://${ip}:3000`, '_blank')
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wifi className="h-5 w-5" />
            <span>网络信息</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>正在获取网络信息...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wifi className="h-5 w-5" />
          <span>移动端访问</span>
        </CardTitle>
        <CardDescription>
          以下IP地址可供移动设备访问本系统
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {ipAddresses.map((ip, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{ip}</Badge>
              <span className="text-sm text-muted-foreground">端口 3000</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(ip)}
              >
                <Copy className="h-4 w-4 mr-1" />
                复制
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openInBrowser(ip)}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                打开
              </Button>
            </div>
          </div>
        ))}
        <div className="text-xs text-muted-foreground">
          <p>• 确保移动设备和电脑在同一局域网内</p>
          <p>• 如果无法访问，请检查防火墙设置</p>
          <p>• 建议使用 Chrome 或 Safari 浏览器访问</p>
        </div>
      </CardContent>
    </Card>
  )
}