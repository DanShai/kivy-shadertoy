'''
Created on Jul 15, 2016

@author: dan
'''
from kivy.properties import (BooleanProperty, ListProperty, NumericProperty,
                             ObjectProperty, StringProperty)

from .f_boxlayout import FBoxLayout
from .f_button import FButton
from .f_carousel import FCarousel
from .f_icon_label import FIconLabel
from .f_widget import FWidget


class FcarSpinner(FCarousel):

    text = StringProperty('')
    values = ListProperty([''])

    def __init__(self, **kwargs):
        super(FcarSpinner, self).__init__(**kwargs)
#        self.bg_color  = ['Blue', '400']
        self.direction = 'right'
        self.size_hint = (1, 1)
        self.anim_move_duration = 0.1
        self.anim_type = 'in_out_back'
        self.loop = True
        self.min_move = 0.01
        self.outline_color = ['White', '500']
        self.makeValues(self.values)
        # self.sp_width= 1

        # self.bg_color = ['White','500']

    def on_touch_down(self, touch):
        if self.values:
            if self.collide_point(touch.x, touch.y):
                if touch.x >= self.pos[0] + self.width / 2:
                    self.index = (self.index + 1) % len(self.slides)
                else:
                    self.index = (self.index - 1) % len(self.slides)

        return super(FcarSpinner, self).on_touch_down(touch)
        #super(FcarSpinner, self).on_touch_down(touch)
        # return True

    def on_touch_up(self, touch):
        return super(FcarSpinner, self).on_touch_up(touch)
        #super(FcarSpinner, self).on_touch_up(touch)
        # return True

    def on_values(self, *args):
        if self.values:
            self.makeValues(self.values)
            if self.slides:
                sld = self.current_slide
                cur_but = sld.children[1]
                self.text = cur_but.text

    def on_index(self, *args):
        super(FcarSpinner, self).on_index(self, *args)
        if self.slides:
            sld = self.current_slide
            cur_but = sld.children[1]
            self.text = cur_but.text

    def makeValues(self, values):

        self.clear_widgets()

        if values:
            for val in values:
                box = FBoxLayout()
                box.size_hint = (1, 1)
                box.spacing = '0dp'
                box.padding = '2dp'
                box.sp_width = 1
                box.sp_round = 2
                box.outline_color = ['White', '500']
                # box = FBoxLayout(size_hint=(1,1),spacing=0,padding=2)
                box.p_width = 0

                plabel = FIconLabel(icon='fa-caret-left')
                plabel.size_hint = (.2, 1)
                plabel.bg_color = ['Red', '300']
                plabel.txt_color = ['Orange', '100']
                plabel.outline_color = ['Red', '300']
                plabel.sp_width = 1
                plabel.p_width = 0
                box.add_widget(plabel)

                btn = FButton()
                btn.size_hint = (1, 1)
                btn.txt_color = ['Orange', '100']
                btn.text = val
                btn.animate_me = False
                btn.n_color = ['Red', '300']
                btn.d_color = ['Red', '300']
                btn.outline_color = ['Red', '300']
                btn.sp_round = 0
                btn.sp_width = 1
                box.add_widget(btn)

                nlabel = FIconLabel(icon='fa-caret-right')
                nlabel.size_hint = (.2, 1)
                nlabel.bg_color = ['Red', '300']
                nlabel.txt_color = ['Orange', '100']
                nlabel.outline_color = ['Red', '300']
                nlabel.sp_width = 1
                nlabel.p_width = 0
                box.add_widget(nlabel)

                self.add_widget(box)
