'''

@author: dan
'''
from kivy.graphics import Color, Ellipse, Rectangle
from kivy.lang import Builder
from kivy.properties import (BooleanProperty, ListProperty, NumericProperty,
                             ObjectProperty, StringProperty)
from kivy.uix.button import Button

from .f_scalable import ScalableBehaviour
from .f_widget import FWidget
from .utils import get_icon_char, get_rgba_color


Builder.load_string('''

<FButton>:
    canvas.before:
        Color:
            rgba: (self.get_color(self.n_color,self.balpha) if self.state == 'normal' else self.get_color(self.d_color,self.balpha)) if not self.disabled else self.get_color(self.n_color,self.balpha)
        Rectangle:
            pos: self.pos[0],self.pos[1]
            size: self.width,self.height
        Color:
            rgba: self.get_color(self.outline_color,self.balpha)
        Line:
            rounded_rectangle: [self.x , self.y, self.width , self.height, sp(self.sp_round)]
            width: sp(self.sp_width) if self.sp_width else sp(1)

    Label:
        id: micon
        font_name:'fwidgets/data/font/fontawesome-webfont.ttf'
        size: 40,40
        pos: root.pos[0]+root.width - self.width, root.pos[1]+root.height-self.height
        font_size: self.height * .75
        text: root.get_icon(root.icon) if root.icon else ''
        color: root.get_color(root.txt_color)





''')


class FButton(Button,  ScalableBehaviour):
    n_color = ListProperty(['Red', '300'])
    d_color = ListProperty(['Orange', '300'])
    icon = StringProperty('')
    get_icon = ObjectProperty(get_icon_char)
    get_color = ObjectProperty(get_rgba_color)
    txt_color = ListProperty(['White', '100'])
    balpha = NumericProperty(1)
    outline_color = ListProperty(['Red', '300'])
    sp_width = NumericProperty(1)
    sp_round = NumericProperty(2)

    def __init__(self, **kwargs):
        super(FButton, self).__init__(**kwargs)

        self.get_color = get_rgba_color
        self.get_icon = get_icon_char

        self.background_color = (1, 1, 1, 0)
        self.color = self.get_color(self.txt_color, self.balpha)
        self.ripple_base_color = self.d_color

        self.markup = True
        self.halign = 'center'
        self.valign = 'middle'
        self.size_hint = 1, 1
        self.font_size = self.initial_font_size  # self.height * .75

    def on_txt_color(self, widget, txt_color):
        self.color = self.get_color(txt_color, self.balpha)
        self.ids.micon.color = self.get_color(txt_color, self.balpha)

    def get_font(self, font_file):
        pass
