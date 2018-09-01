
from kivy.app import App
from kivy.uix.widget import Widget
from kivy.graphics import BindTexture, RenderContext
from kivy.properties import StringProperty, NumericProperty, ListProperty, ObjectProperty
from kivy.uix.effectwidget import shader_header
from kivy.clock import Clock, mainthread
from time import gmtime
from kivy.uix.popup import Popup
from functools import partial
from fwidgets.f_text_input import FTextInput
#from kivy.uix.textinput import TextInput
from fwidgets.f_label import FLabel
from fwidgets.f_boxlayout import FBoxLayout
from fwidgets.f_button import FButton
from kivy.core.window import Window
from os import listdir
from kivy.lang import Builder
from kivy.base import EventLoop
from unidecode import unidecode
import re


Builder.load_file('./GUI/shaderwidget.kv')



class ShaderWidget(Widget):
    shader_source = StringProperty("")
    nFrames = StringProperty("0")
    iChannel0_source = StringProperty()
    iChannel1_source = StringProperty()
    iChannel2_source = StringProperty()
    iChannel3_source = StringProperty()
    iChannel0 = ObjectProperty()
    iChannel1 = ObjectProperty()
    iChannel2 = ObjectProperty()
    iChannel3 = ObjectProperty()
    ichannels_definition = StringProperty('')
    iGlobalTime = NumericProperty(0)
    iMouse = ListProperty([0. , 0. , 0., 0.])
    iChannelResolution = ListProperty([[64. , 64.],[64. , 64.],[64. , 64.],[64. , 64.]])

    def __init__(self, **kwargs):

        EventLoop.ensure_window() 
        self.canvas = RenderContext(use_parent_projection=True, use_parent_modelview=True)        
        #print shader_header
        self.shader_header =  shader_header + open('glsl_headers/shader_header.frag', 'r').read()
        self.shader_source = open('glsl/blank.frag', 'r').read()
        self.shader_footer = open('glsl_headers/shader_footer.frag', 'r').read()
        self.definition_template = open('glsl_headers/definition.frag', 'r').read()

        self.canvas['iChannelResolution'] = self.iChannelResolution


        super(ShaderWidget, self).__init__(**kwargs)
        self.bind(iChannel0_source=self.update_definitions,
                  iChannel1_source=self.update_definitions,
                  iChannel2_source=self.update_definitions,
                  iChannel3_source=self.update_definitions,
                  ichannels_definition=self.update_definitions)


        self.c_event = None
        self.new_name = None
        self.cshader = self.canvas.shader
        self.init_definitions()
        self.init_shader()


    def init_shader(self):
        old_value = self.cshader.fs
        self.cshader.fs = (
            self.shader_header +
            self.ichannels_definition +
            self.rm_non_ascii(self.shader_source) +
            self.shader_footer)
        if not self.cshader.success:
            self.cshader.fs = old_value
            App.get_running_app().warn(' Fragment Shader Error.....! ')
        
        #print self.cshader.fs
    
    

    def init_definitions(self):
        self.ichannels_definition = self.definition_template % (
            'samplerCube' if 'cube' in self.iChannel0_source else 'sampler2D',
            'samplerCube' if 'cube' in self.iChannel1_source else 'sampler2D',
            'samplerCube' if 'cube' in self.iChannel2_source else 'sampler2D',
            'samplerCube' if 'cube' in self.iChannel3_source else 'sampler2D')
        
        #print self.ichannels_definition


    def on_shader_source(self, *args):
        #print "shad souce changed"
        self.init_shader()

    def update_definitions(self, *args):
        self.init_definitions()

    def play( self, bt , atext) : 
        #print  self.canvas.shader.fs
        if bt.state == "down" :
            self.shader_source = atext
            bt.text = "Pause"
            bt.icon = "fa-pause"
            self.init_shader()
            self.c_event = Clock.schedule_interval(self.update_glsl, 0.)
        else:
            Clock.unschedule(self.c_event)
            bt.text = "Play"
            bt.icon = "fa-play"


    @mainthread
    def update_glsl(self, dt):

        t = gmtime()
        self.iGlobalTime += dt
        sz = self.size
        pz = self.pos
        ms = self.iMouse
        
        self.canvas['iGlobalTime'] = self.iGlobalTime
        self.canvas['iTime'] = self.iGlobalTime
        self.canvas['iResolution'] = sz[0], sz[1], pz[0] , pz[1]
        self.canvas['iChannelTime'] = 0
        self.canvas['iDate'] = t.tm_year, t.tm_mon, t.tm_mday, t.tm_sec
        self.canvas['iSampleRate'] = 44100
        self.canvas['iMouse'] = ms[0],ms[1],ms[2],ms[3]
        self.canvas['projection_mat'] = Window.render_context['projection_mat']
        self.canvas['modelview_mat'] = Window.render_context['modelview_mat']
        self.nFrames = str("%.2f" % Clock.get_fps())



    def rm_non_ascii(self, text):
        return re.sub(r'[^\x00-\x7f]',r'', text) 


    def save_file(self,pp,fsp ,scode,*args) :
        txt = str( scode.text)
        with open('glsl/' + self.new_name, 'w') as file:
            file.write(txt)     
        pp.dismiss()
        fsp.values = map(str, sorted( listdir('glsl') ))
        fsp.text = self.new_name


    def launch_popup(self, f_spinner, scode):
        
        self.new_name = str(f_spinner.text)
        f_name = self.new_name.strip()

        font_name = './fwidgets/data/font/fsix.ttf'
        box = FBoxLayout(orientation='vertical',spacing='24dp',bg_color=['Brown','500'],size_hint=(1.,1.), padding='20dp')
        
        #box.add_widget(FLabel(text=" rename " , size_hint=(1, 1), bg_color=['Brown','500'] ))
        mti = FTextInput(text=f_name, size_hint=(1, 1))
        mti.center_text()
        box.add_widget(mti)
        mybutton = FButton(text='OK', size_hint=(1, 1))
        box.add_widget(mybutton)

        popup = Popup(title="Save/Rename",  content=box, size_hint=(.6, .6),title_size='64dp',title_align='center',title_font=font_name)
        ti_callback = partial(self.rename, mti )
        mti.bind(text=ti_callback)
        
        bt_callback = partial(self.save_file, popup,f_spinner, scode)
        mybutton.bind(on_release=bt_callback)
        popup.open()

    def rename(self,mti , *args) :
        self.new_name = str(mti.text).strip()
        

    def on_touch_move(self, touch):
        if self.collide_point(*touch.pos):
            self.iMouse = [touch.pos[0] , touch.pos[1] - self.pos[1] , 1. , 1. ]  
            #print  self.iMouse, self.pos, self.size 
        else:
            return super(ShaderWidget, self).on_touch_move(touch)

    def on_touch_down(self, touch):
        if self.collide_point(*touch.pos):
            self.iMouse = [touch.pos[0] , touch.pos[1] - self.pos[1] , 1. , 0. ]  
            #print  self.iMouse, self.pos, self.size 
        else:
            return super(ShaderWidget, self).on_touch_down(touch)

    def on_touch_up(self, touch):
        if self.collide_point(*touch.pos):
            self.iMouse = [touch.pos[0] , touch.pos[1] - self.pos[1] , 0. , 0. ]  
            #print  self.iMouse, self.pos, self.size 
        else:
            return super(ShaderWidget, self).on_touch_up(touch)



    def update_resolutions(self,indx,reso):
        self.canvas['iChannelResolution'+str(indx)] = reso
        self.iChannelResolution[indx] = reso
        self.canvas['iChannelResolution'] = self.iChannelResolution
            



    def on_iChannel0(self, *args):
        with self.canvas:
            BindTexture(texture=self.iChannel0, index=1)
        self.canvas['iChannel0'] = 1


    def on_iChannel1(self, *args):
        with self.canvas:
            BindTexture(texture=self.iChannel1, index=2)
        self.canvas['iChannel1'] = 2

    def on_iChannel2(self, *args):
        with self.canvas:
            BindTexture(texture=self.iChannel2, index=3)
        self.canvas['iChannel2'] = 3

    def on_iChannel3(self, *args):
        with self.canvas:
            BindTexture(texture=self.iChannel3, index=4)
        self.canvas['iChannel3'] = 4
