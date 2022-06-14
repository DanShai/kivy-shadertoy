'''
Created on Jul 5, 2016

@author: dan
'''
from kivy.lang import Builder
from kivy.properties import ListProperty, NumericProperty, StringProperty, BooleanProperty, ObjectProperty
from kivy.uix.togglebutton import ToggleButton
from kivy.graphics import Rectangle, Color, Ellipse
from .utils import get_icon_char, get_rgba_color
from .f_scalable import ScalableBehaviour


Builder.load_string('''


<FCheck>:

    canvas.before:
        Color:
            rgba: self.get_color(self.n_color,self.balpha) if self.state == 'normal' else self.get_color(self.d_color,self.balpha)
        Rectangle:
            pos: self.pos
            size: self.size
        Color:
            rgba: self.get_color(self.outline_color,self.balpha)
        Line:
            rounded_rectangle: [self.x , self.y, self.width , self.height, sp(self.sp_round)]
            width: sp(self.sp_width) if self.sp_width else sp(1)
    Label:
        id: micon
        font_name:'fwidgets/data/font/fontawesome-webfont.ttf'
        pos: root.pos
        size: root.size
        font_size: self.height * .8
        text: root.get_icon(root.icon) if root.state == 'normal' else root.get_icon(root.dis_icon)
        color: root.get_color(root.active_txt_color,.25) if root.state == 'normal' else root.get_color(root.active_txt_color,1)



''')


class FCheck(ToggleButton, ScalableBehaviour):

    balpha = NumericProperty(1)
    outline_color = ListProperty(['Red', '300'])
    sp_width = NumericProperty(1)
    sp_round = NumericProperty(4)

    n_color = ListProperty(['Red', '300'])
    d_color = ListProperty(['Orange', '400'])
    icon = StringProperty('fa-check')
    dis_icon = StringProperty('fa-check')
    get_icon = ObjectProperty(get_icon_char)
    get_color = ObjectProperty(get_rgba_color)
    txt_color = ListProperty(['Orange', '100'])
    active_txt_color = ListProperty(['Orange', '100'])

    def __init__(self, **kwargs):

        super(FCheck, self).__init__(**kwargs)
        self.get_color = get_rgba_color
        self.get_icon = get_icon_char
        self.background_color = (1, 1, 1, 0)
        self.ripple_base_color = self.d_color

        self.markup = True
        self.halign = 'center'
        self.valign = 'middle'
        self.color = self.get_color(self.txt_color, self.balpha)
        self.size_hint = .5, 1
        #self.size = [50,50]
        self.font_size = self.initial_font_size
        # self.text_size = self.size

    def on_txt_color(self, widget, color):
        self.color = self.get_color(color, self.balpha)
        self.ids.micon.color = self.get_color(color, self.balpha)

    def get_font(self, font_file):
        return construct_target_file_name(font_file, None)
