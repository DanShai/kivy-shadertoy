
from kivy.utils import get_color_from_hex, platform

from .color_definitions import colors
from .fa_icon_definitions import fa_icons


def get_icon_char(icon):
    if icon != '':
        try:
            return fa_icons[icon]
        except:
            return ''
    else:
        return ''


def get_rgba_color(color_tuple, control_alpha=None):

    if len(color_tuple) != 2 or color_tuple is None:
        color_tuple = ['Brown', '300']
    color, weight = color_tuple
    try:
        color = get_color_from_hex(colors[color][weight])
    except:
        return (1., 1., 1., 1.)
    if control_alpha is None:
        return color
    else:
        color[3] = control_alpha
        return color
